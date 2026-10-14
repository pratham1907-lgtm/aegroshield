import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function SupabaseTestPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Attempt to query 'todos' table as in the quickstart guide
  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div style={{ padding: "60px 20px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>
        Supabase Connection Status
      </h1>
      {error ? (
        <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #f87171", borderRadius: "8px", color: "#991b1b" }}>
          <p><strong>Connection established</strong>, but &apos;todos&apos; table returned an error (table may not exist yet in Supabase):</p>
          <pre style={{ fontSize: "0.85rem", marginTop: "8px", overflowX: "auto" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <div>
          <p style={{ color: "#16a34a", fontWeight: "600", marginBottom: "12px" }}>
            ✅ Successfully connected to Supabase Client!
          </p>
          <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            {todos && todos.length > 0 ? (
              todos.map((todo: any) => (
                <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
              ))
            ) : (
              <li style={{ color: "#64748b" }}>Connected successfully. No items found in &apos;todos&apos; table yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
