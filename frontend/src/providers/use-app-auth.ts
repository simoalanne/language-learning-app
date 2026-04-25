import { useAuth, useClerk, useUser } from "@clerk/react";

const getDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | undefined,
) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (email) {
    return email;
  }

  return "User";
};

export const useAppAuth = () => {
  const auth = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  return {
    ...auth,
    signOut,
    user,
    isAuthenticated: auth.isSignedIn,
    displayName: getDisplayName(
      user?.firstName,
      user?.lastName,
      user?.primaryEmailAddress?.emailAddress,
    ),
  };
};
