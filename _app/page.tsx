import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: "ben@samsa.com",
    password: "simba_is_a_cat",
  });

  const error = authError;

  if (error) {
    console.error("Error fetching todos:", error.message);
    return <div>Error fetching todos</div>;
  }

  return (
    <main>
      <h1>Supabase Todos</h1>
      <ul></ul>
    </main>
  );
}
