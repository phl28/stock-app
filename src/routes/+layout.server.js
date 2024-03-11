export const load = (({ cookies }) => {
    const loggedIn = cookies.get('logged_in');
   
    return {
      loggedIn: loggedIn
    };
  }
)
