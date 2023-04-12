import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GitHubLogoIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Search from "~/components/search/Search";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import { useSignOutMutation } from "~/data/auth/sign-out-mutation";
import { useUsersOrganizationsQuery } from "~/data/organizations/users-organizations-query";
import { useUser } from "~/lib/auth";
import { getAvatarUrl } from "~/lib/avatars";

const Navbar = () => {
  const router = useRouter();
  const user = useUser();
  const [theme, setTheme] = useState<string>();

  useEffect(() => {
    if (
      localStorage.dbdev_theme === "dark" ||
      (!("dbdev_theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      if (theme === "dark") document.body.classList.replace("light", "dark");
    } else {
      if (theme === "light") document.body.classList.replace("dark", "light");
    }
    setTheme(theme);
  }, []);

  useEffect(() => {
    if (theme) localStorage.setItem("dbdev_theme", theme);
    if (theme === "light") document.body.classList.replace("dark", "light");
    if (theme === "dark") document.body.classList.replace("light", "dark");
  }, [theme]);

  const {
    data: organizations,
    isLoading: isOrganizationsLoading,
    isSuccess: isOrganizationsSuccess,
  } = useUsersOrganizationsQuery({
    userId: user?.id,
  });

  const avatarUrl = useMemo(
    () =>
      user ? getAvatarUrl(user.user_metadata.avatar_path ?? null) : undefined,
    [user]
  );

  const avatarName: string =
    user?.user_metadata.display_name ??
    user?.user_metadata.handle ??
    "Current User";

  const avatarFallback = avatarName
    .split(" ")
    .map((n) => n[0])
    .join(" ");

  const { mutate: signOut } = useSignOutMutation();
  const handleSignOut = useCallback(() => {
    signOut(undefined, {
      onSuccess() {
        toast.success("You have signed out successfully!");
        router.push("/sign-in");
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  }, [router, signOut]);

  return (
    <header className="px-4 py-4 border-b border-gray-100 dark:border-slate-700 shadow-sm md:px-8">
      <nav className="flex items-center justify-between gap-4 md:gap-6">
        <div>
          <Link href="/">
            <img
              src={
                theme === "light"
                  ? "/images/dbdev-lightmode.png"
                  : "/images/dbdev-darkmode.png"
              }
              alt="dbdev logo"
              className="h-10"
            />
          </Link>
        </div>

        <div className="flex-1 max-w-3xl">
          <Search />
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center ml-4">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Avatar>
                    <AvatarImage src={avatarUrl} alt={avatarName} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="px-4 py-2 bg-white border border-gray-200 rounded shadow-lg"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/${user?.user_metadata.handle}/edit`}
                        className="flex items-center"
                      >
                        <Avatar size="sm">
                          <AvatarImage src={avatarUrl} alt={avatarName} />
                          <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>

                        <span className="ml-2 text-lg">
                          {user?.user_metadata.display_name ??
                            user?.email ??
                            "Account"}
                        </span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px my-2 bg-gray-200" />

                    <DropdownMenu.Group className="flex flex-col">
                      <DropdownMenu.Label className="text-xs text-gray-600">
                        Organizations
                      </DropdownMenu.Label>

                      {isOrganizationsSuccess &&
                        organizations.map((org) => (
                          <DropdownMenu.Item key={org.id} asChild>
                            <Link href={`/${org.handle}`}>
                              {org.display_name} ({org.handle})
                            </Link>
                          </DropdownMenu.Item>
                        ))}

                      <DropdownMenu.Item asChild>
                        <Link href="/organizations/new">New Organization</Link>
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>

                    <DropdownMenu.Separator className="h-px my-2 bg-gray-200" />

                    <DropdownMenu.Item asChild>
                      <button onClick={handleSignOut}>Sign Out</button>
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className="fill-gray-100" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-up"
                  className="transition text-sm rounded text-gray-600 hover:text-gray-800 dark:text-slate-400 border border-gray-300 hover:border-gray-500 dark:border-slate-700 py-2 px-4 dark:hover:bg-slate-800 hover:dark:text-white"
                >
                  Sign Up
                </Link>
                <Link
                  href="/sign-in"
                  className="transition text-sm text-gray-600 hover:text-gray-800 dark:text-slate-400 hover:dark:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6 border-l pl-8 py-3">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <div className="dark:text-white">
                  {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-28 border bg-white dark:bg-slate-900 dark:border-slate-600 shadow py-2 rounded">
                <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenu.RadioItem
                    value="light"
                    className="cursor-pointer pl-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center space-x-1 py-1"
                  >
                    <div className="dark:text-white">
                      <SunIcon />
                    </div>
                    <p className="pl-2 text-sm dark:text-white">Light</p>
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    value="dark"
                    className="cursor-pointer pl-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center space-x-1 py-1"
                  >
                    <div className="dark:text-white">
                      <MoonIcon />
                    </div>
                    <p className="pl-2 text-sm dark:text-white">Dark</p>
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Link
              href="https://github.com/supabase/dbdev"
              className="opacity-60 hover:opacity-100 transition"
            >
              <div className="dark:text-white">
                <GitHubLogoIcon />
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
