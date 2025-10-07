import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard",
    "/budgeting",
    "/debts",
    "/financial-goals",
    "/crypto-portfolio",
    "/investment-portfolio",
    "/settings"
  ],
}; 