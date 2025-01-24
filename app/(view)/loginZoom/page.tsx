"use client";

export default function Login() {
  const handleLogin = () => {
    const zoomAuthorizeUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_ZOOM_REDIRECT_URI}`;
    window.location.href = zoomAuthorizeUrl;
  };

  return (
    <div>
      <h1>Login with Zoom</h1>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
