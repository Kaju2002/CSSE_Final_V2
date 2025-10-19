import React, { useState } from "react";
import Input from "../Shared_Ui/Input";
import Button from "../ui/Button";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // simple validation
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    setError(null);
    // TODO: call auth API
    console.log("login", { username, password });
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-6">
      <div className="  grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:block">
          <div className="overflow-hidden border border-[#e1eaf5] bg-white shadow-md">
            <img
              src="/login.webp"
              alt="hospital reception"
              className="w-full h-[550px] object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-[#e1eaf5] rounded-3xl shadow-sm p-10">
            <h2 className="text-2xl font-semibold text-[#1b2b4b] mb-2 text-center md:text-left">
              Welcome Back
            </h2>
            <p className="text-sm text-[#6f7d95] mb-8 text-center md:text-left">
              Log in to your account to access your patient dashboard.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                placeholder="Enter your ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                name="username"
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 font-semibold">
                  Login
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm font-medium text-[#2a6bb7]">
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
