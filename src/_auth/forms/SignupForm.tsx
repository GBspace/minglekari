import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/shared/loader";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutations";
import { SignupValidation } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";

const SignupForm = () => {
  const { toast } = useToast();
  const {
    checkAuthUser,
    // , isLoading: isUserLoading
  } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: createUserAccountInDB, isPending: isCreatingUser } =
    useCreateUserAccount();

  const {
    mutateAsync: signInAccount,
    // , isPending: isSigningIn
  } = useSignInAccount();
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SignupValidation>) => {
    const newUser = await createUserAccountInDB(values);
    if (!newUser) {
      return toast({ title: "Sign up failed, please try again" });
    }

    const session = await signInAccount({
      email: values.email,
      password: values.password,
    });
    if (!session) {
      return toast({ title: "Sign up failed. Please try again." });
    }

    const isLoggedIn = await checkAuthUser();
    if (isLoggedIn) {
      form.reset();
      navigate("/");
    } else {
      return toast({
        title: "Signup failed, please try again",
      });
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          {" "}
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-12">
          {" "}
          To use Minglekari enter your account
        </p>
        <form
          className="flex flex-col gap-5 w-full mt-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isCreatingUser ? (
              <div className="flex-center gap-2">
                <Loader /> {"Loading..."}
              </div>
            ) : (
              "Sign-up"
            )}
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?{" "}
            <Link
              className="text-primary-500 text-small-semi-bold ml-1"
              to="/sign-in"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;

/*


POST
creator
likes
caption
tags
imageUrl
imageId
location


USER:
posts
liked
name
username
accountId
email
bio
imageId
imageUrl

SAVES:
users
post


*/
