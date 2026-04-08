export const auth = {
  login: (user: any) => {
    localStorage.setItem("studyflare_user", JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem("studyflare_user");
  },
  getUser: () => {
    const user = localStorage.getItem("studyflare_user");
    return user ? JSON.parse(user) : null;
  },
  getUserId: () => {
    const user = auth.getUser();
    return user ? user.id : 1; // Default to 1 for simulation if needed, but preferably real ID
  }
};
