import authConfig from "@/lib/auth.config"
import NextAuth from "next-auth"

export const config = {
	matcher: ["/app/:path*"],
};

const { auth } = NextAuth(authConfig)

export default auth((req) => {
	// Allow unauthenticated access to root route
	// Only protect /app/* routes if we add them in the future
	return;
});