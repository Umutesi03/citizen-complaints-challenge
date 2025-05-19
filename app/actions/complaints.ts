'use server';

import { sql, generateTrackingId } from '@/lib/db';
import { getUser } from './auth';

export async function getCategories() {
  try {
    // Get main categories
    const mainCategories = await sql`
      SELECT id, name, code, description
      FROM categories
      WHERE parent_id IS NULL
      ORDER BY name
    `;

    // For each main category, get its subcategories
    const categoriesWithSubs = await Promise.all(
      mainCategories.map(async (category) => {
        const subcategories = await sql`
          SELECT id, name, code, description
          FROM categories
          WHERE parent_id = ${category.id}
          ORDER BY name
        `;
        return {
          ...category,
          subcategories,
        };
      })
    );

    return categoriesWithSubs;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array instead of throwing to prevent UI errors
  }
}

export async function getInstitutions() {
  try {
    const institutions = await sql`
      SELECT id, name, code, description, province, district
      FROM institutions
      ORDER BY name
    `;
    return institutions;
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return []; // Return empty array instead of throwing
  }
}

export async function submitComplaint(formData: FormData) {
  try {
    const user = await getUser();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('category')
      ? Number.parseInt(formData.get('category') as string)
      : null;
    const subcategoryId = formData.get('subcategory')
      ? Number.parseInt(formData.get('subcategory') as string)
      : null;
    const location = formData.get('location') as string;
    const priority = formData.get('priority') as string;
    const province = formData.get('province') as string;
    const district = formData.get('district') as string;
    const sector = (formData.get('sector') as string) || null;
    const contactInfo = (formData.get('contact') as string) || null;
    const isAnonymous =
      formData.get('anonymous') === 'true' ||
      formData.get('anonymous') === 'on';

    // Extract files from formData
    const files = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file-') && value instanceof File) {
        files.push(value);
      }
    }

    console.log('Submitting complaint with data:', {
      title,
      description,
      categoryId,
      subcategoryId,
      location,
      priority,
      province,
      district,
      sector,
      contactInfo,
      isAnonymous,
      fileCount: files.length,
    });

    if (
      !title ||
      !description ||
      !categoryId ||
      !location ||
      !priority ||
      !province ||
      !district
    ) {
      return {
        error: 'Please fill in all required fields',
      };
    }

    // Generate a tracking ID
    const trackingId = generateTrackingId();

    // Determine which institution should handle this complaint based on category and location
    let institutionId = null;
    try {
      const institutionResult = await sql`
        SELECT i.id
        FROM institutions i
        WHERE (i.district = ${district} OR i.district IS NULL)
        ORDER BY i.district NULLS LAST
        LIMIT 1
      `;

      if (institutionResult.length > 0) {
        institutionId = institutionResult[0].id;
      }
    } catch (error) {
      console.error('Error finding institution:', error);
    }

    console.log('Selected institution ID:', institutionId);

    // Insert the complaint - using a more flexible approach with explicit column names
    const insertColumns = [
      'tracking_id',
      'title',
      'description',
      'category_id',
      'subcategory_id',
      'status',
      'priority',
      'location',
      'province',
      'district',
      'sector',
      'citizen_id',
      'institution_id',
      'is_anonymous',
      'contact_info',
    ];

    const insertValues = [
      trackingId,
      title,
      description,
      categoryId,
      subcategoryId,
      'submitted',
      priority,
      location,
      province,
      district,
      sector,
      user?.id || null,
      institutionId,
      isAnonymous,
      contactInfo,
    ];

    // Build the query dynamically
    const insertQuery = `
      INSERT INTO complaints (${insertColumns.join(', ')})
      VALUES (${insertColumns.map((_, i) => `$${i + 1}`).join(', ')})
      RETURNING id, tracking_id
    `;

    // Execute the query
    const result = await sql.query(insertQuery, insertValues);

    if (!result || result.rowCount === 0) {
      console.error('Failed to insert complaint - no result returned');
      return {
        error: 'Failed to submit complaint. Please try again.',
      };
    }

    console.log('Complaint inserted:', result[0]);

    // Add initial status update
    await sql`
      INSERT INTO updates (complaint_id, status, comment)
      VALUES (${result[0].id}, 'submitted', 'Complaint received and logged in the system.')
    `;

    // Process and store files
    // In a real application, you would upload these files to a storage service
    // For this demo, we'll just log the files and store metadata in the database
    if (files.length > 0) {
      for (const file of files) {
        // In a real app, upload the file to storage and get a URL
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `/uploads/${fileName}`;
        const fileUrl = `https://citizenconnect.gov.rw${filePath}`;

        // Store file metadata in the database with explicit column names
        const attachmentColumns = [
          'complaint_id',
          'file_name',
          'file_type',
          'file_size',
          'file_url',
          'file_path',
        ];

        const attachmentValues = [
          result[0].id,
          file.name,
          file.type,
          file.size,
          fileUrl,
          filePath,
        ];

        const attachmentQuery = `
          INSERT INTO attachments (${attachmentColumns.join(', ')})
          VALUES (${attachmentColumns.map((_, i) => `$${i + 1}`).join(', ')})
        `;

        await sql.query(attachmentQuery, attachmentValues);
      }

      console.log(
        `${files.length} files attached to complaint ${result[0].id}`
      );
    }

    return {
      success: true,
      trackingId: result[0].tracking_id,
    };
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return {
      error:
        'An error occurred while submitting your complaint: ' +
        (error instanceof Error ? error.message : String(error)),
    };
  }
}

export async function getComplaintByTrackingId(trackingId: string) {
  if (!trackingId) {
    return null;
  }

  try {
    let complaint = null;

    // Step 1: Fetch the main complaint with related info (excluding messages)
    try {
      const result = await sql`
        SELECT 
          c.id, 
          c.tracking_id, 
          c.title, 
          c.description, 
          c.status, 
          c.priority,
          c.location, 
          c.province, 
          c.district, 
          c.sector, 
          c.created_at, 
          c.updated_at,
          cat.name as category_name, 
          subcat.name as subcategory_name,
          i.name as institution_name
        FROM complaints c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN categories subcat ON c.subcategory_id = subcat.id
        LEFT JOIN institutions i ON c.institution_id = i.id
        WHERE c.tracking_id = ${trackingId}
      `;

      if (!result || result.length === 0) {
        return null;
      }

      complaint = result[0];
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    }

    // Step 2: Fetch messages for this complaint (conversation thread)
    let messages = [];
    try {
      messages = await sql`
  SELECT 
    m.id, 
    m.content, 
    m.created_at, 
    u.full_name AS sender_name
  FROM messages m
  LEFT JOIN users u ON m.sender_id = u.id
  WHERE m.complaint_id = ${complaint.id}
  ORDER BY m.created_at ASC`;
    } catch (error) {
      console.error('Error fetching messages:', error);
      messages = [];
    }

    // Step 3: Fetch updates
    let updates = [];
    try {
      updates = await sql`
        SELECT id, status, comment, created_at
        FROM updates
        WHERE complaint_id = ${complaint.id}
        ORDER BY created_at DESC
      `;
    } catch (error) {
      console.error('Error fetching updates:', error);
      updates = [];
    }

    // Step 4: Fetch attachments
    let attachments = [];
    try {
      attachments = await sql`
        SELECT id, file_name, file_type, file_size, file_url, file_path, created_at
        FROM attachments
        WHERE complaint_id = ${complaint.id}
        ORDER BY created_at DESC
      `;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      attachments = [];
    }

    // Final return
    return {
      ...complaint,
      messages: messages || [],
      updates: updates || [],
      attachments: attachments || [],
    };
  } catch (error) {
    console.error('Error in getComplaintByTrackingId:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch complaint information');
  }
}

export async function getComplaints(institutionId?: number, status?: string) {
  try {
    const whereConditions = [];
    let query = `
      SELECT 
        c.id, c.tracking_id, c.title, c.status, c.priority,
        c.province, c.district, c.created_at, c.updated_at,
        cat.name as category_name, i.name as institution_name
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN institutions i ON c.institution_id = i.id
    `;

    if (institutionId) {
      whereConditions.push(`c.institution_id = ${institutionId}`);
    }

    if (status && status !== 'all') {
      whereConditions.push(`c.status = '${status}'`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY c.created_at DESC`;

    // Use the tagged template syntax for dynamic queries
    const result = await sql.raw(query);

    // Ensure we always return an array
    return Array.isArray(result.rows) ? result.rows : [];
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
}

export async function updateComplaintStatus(
  complaintId: number,
  status: string,
  comment: string
) {
  const user = await getUser();

  if (!user) {
    return {
      error: 'You must be logged in to update a complaint',
    };
  }

  try {
    // Update the complaint status
    await sql`
      UPDATE complaints
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${complaintId}
    `;

    // Add a status update
    await sql`
      INSERT INTO updates (complaint_id, status, comment, user_id)
      VALUES (${complaintId}, ${status}, ${comment}, ${user.id})
    `;

    return { success: true };
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return {
      error: 'An error occurred while updating the complaint',
    };
  }
}

export async function respondToComplaint(complaintId: number, message: string) {
  const user = await getUser();

  if (!user) {
    return {
      error: 'You must be logged in to respond to a complaint',
    };
  }

  try {
    // Add a message
    await sql`
      INSERT INTO messages (complaint_id, sender_id, content)
      VALUES (${complaintId}, ${user.id}, ${message})
    `;

    return { success: true };
  } catch (error) {
    console.error('Error responding to complaint:', error);
    return {
      error: 'An error occurred while sending your response',
    };
  }
}
