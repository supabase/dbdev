import Nav from "./components/Nav";
import { supabase } from "./lib/supabaseClient";
import { Typography, Button } from "@supabase/ui";
import Footer from "./components/Footer";
import { AuthUser } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Input } from "@supabase/ui";

export default function Profile() {
  const [session, setSession] = useState(supabase.auth.session());
  const [user, setUser] = useState(supabase.auth.user());

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
  }, []);

  return (
    <>
      <div className="min-h-full">
        <Nav />
        <main>
          <section className="">
            {!user ? <Auth /> : <Account user={user} />}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

const Auth = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function signUp() {
    const { user, session, error } = await supabase.auth.signUp(
      {
        email,
        password,
      },
      {
        data: {
          username,
        },
      }
    );

    if (error) alert(error.message);
  }

  return (
    <div className="grid gap-4 grid-cols-2  w-3/4 my-12 m-auto">
      <div className="">
        <Typography.Title level={3}>Login</Typography.Title>
        <div>
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Button>Sign up</Button>
        </div>
      </div>
      <div>
        <Typography.Title level={3}>Sign up</Typography.Title>
        <div>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="Password (again)"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={() => signUp()}>Sign up</Button>
        </div>
      </div>
    </div>
  );
};

const Account = ({ user }: { user: AuthUser }) => {
  return (
    <>
      <Typography.Text>Signed in: {user.email}</Typography.Text>
      <Button block onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    </>
  );
};
