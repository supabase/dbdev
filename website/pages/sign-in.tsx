import { isAuthApiError } from "@supabase/supabase-js";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Form, { FORM_ERROR } from "~/components/forms/Form";
import FormButton from "~/components/forms/FormButton";
import FormInput from "~/components/forms/FormInput";
import Layout from "~/components/layouts/Layout";
import H1 from "~/components/ui/typography/H1";
import { useSignInMutation } from "~/data/auth/sign-in-mutation";
import { NextPageWithLayout } from "~/lib/types";
import { SignInSchema } from "~/lib/validations";

const SignInPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { mutateAsync: signIn } = useSignInMutation({
    onSuccess() {
      toast.success("You have signed in successfully!");
      router.replace("/");
    },
  });

  return (
    <div className="flex items-center justify-center flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Sign In | dbdev</title>
      </Head>

      <div className="w-full h-full max-w-lg space-y-8 py-12 px-10 border rounded-md border-gray-200 dark:border-slate-700">
        <H1>Sign In</H1>

        <Form
          initialValues={{
            email: "",
            password: "",
          }}
          onSubmit={async ({ email, password }) => {
            try {
              await signIn({ email, password });
            } catch (error: any) {
              if (isAuthApiError(error)) {
                return {
                  [FORM_ERROR]: error.message,
                };
              }

              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " +
                  error.toString(),
              };
            }
          }}
          schema={SignInSchema}
        >
          <div className="space-y-4">
            <FormInput
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
            />

            <div>
              <FormInput
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
              />
              <div className="flex items-center justify-end mt-2 text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <FormButton>Sign In</FormButton>
        </Form>
      </div>
    </div>
  );
};

SignInPage.getLayout = (page) => <Layout>{page}</Layout>;

export default SignInPage;
