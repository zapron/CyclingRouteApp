// services/auth.ts
interface User {
  username: string;
  password: string;
}

// Hard-coded list of up to 5 users
const dummyUsers: User[] = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
];

export function authenticate(username: string, password: string): boolean {
  return dummyUsers.some(
    (user) => user.username === username && user.password === password
  );
}
