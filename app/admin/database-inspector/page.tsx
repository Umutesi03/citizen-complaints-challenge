"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, Table, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { inspectTableSchema, listTables } from "@/app/actions/schema"
import { getUser } from "@/app/actions/auth"

export default function DatabaseInspector() {
  const router = useRouter()
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [tableSchema, setTableSchema] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await getUser()
        if (!userData || userData.role !== "admin") {
          router.push("/login")
          return
        }
        setUser(userData)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    async function fetchTables() {
      if (!user) return

      try {
        setLoading(true)
        const result = await listTables()

        if (result.success) {
          setTables(result.tables)
          if (result.tables.length > 0) {
            setSelectedTable(result.tables[0].table_name)
          }
        } else {
          setError(result.error || "Failed to fetch tables")
        }
      } catch (error) {
        console.error("Error fetching tables:", error)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTables()
    }
  }, [user])

  useEffect(() => {
    async function fetchTableSchema() {
      if (!selectedTable) return

      try {
        setLoading(true)
        const result = await inspectTableSchema(selectedTable)

        if (result.success) {
          setTableSchema(result.columns)
        } else {
          setError(result.error || `Failed to fetch schema for ${selectedTable}`)
        }
      } catch (error) {
        console.error(`Error fetching schema for ${selectedTable}:`, error)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (selectedTable) {
      fetchTableSchema()
    }
  }, [selectedTable])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Database Schema Inspector</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>
            Inspect your database schema to ensure your code matches the actual database structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <Tabs defaultValue="tables" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="schema" disabled={!selectedTable}>
                  {selectedTable ? `${selectedTable} Schema` : "Table Schema"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tables">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <Card
                      key={table.table_name}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedTable === table.table_name ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedTable(table.table_name)}
                    >
                      <CardContent className="p-4 flex items-center">
                        <Table className="h-5 w-5 mr-2 text-primary" />
                        <span>{table.table_name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schema">
                {selectedTable && (
                  <>
                    <div className="flex items-center mb-4">
                      <Database className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">{selectedTable}</h3>
                    </div>

                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50">
                        <div>Column Name</div>
                        <div>Data Type</div>
                        <div>Nullable</div>
                        <div>Default Value</div>
                      </div>

                      {tableSchema.map((column, index) => (
                        <div
                          key={column.column_name}
                          className={`grid grid-cols-4 gap-4 p-4 items-center ${
                            index < tableSchema.length - 1 ? "border-b" : ""
                          }`}
                        >
                          <div className="font-medium">{column.column_name}</div>
                          <div>{column.data_type}</div>
                          <div>{column.is_nullable === "YES" ? "Yes" : "No"}</div>
                          <div className="truncate">{column.column_default || "-"}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
