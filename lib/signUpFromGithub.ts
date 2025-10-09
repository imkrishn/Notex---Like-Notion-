import { account } from "@/app/appwrite"
import { OAuthProvider } from "appwrite"
import { toast } from "sonner";

//login function

export const login = async () => {
  try {
    await account.createOAuth2Session(
      OAuthProvider.Github,
      `${process.env.NEXT_PUBLIC_URL!}/you/home`,
      `${process.env.NEXT_PUBLIC_URL!}/auth/login`,
    )


  } catch (error) {
    console.error('Login error:', error);
    toast.error('Failed you to login.Try again')
  }
}

// logout function

export const logout = async () => {
  try {
    account.deleteSession('current')

  } catch (error) {
    console.error('Logout error:', error)
    toast.error('Failed you to log out.Try again')
  }
}


