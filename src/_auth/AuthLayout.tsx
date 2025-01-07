import { Outlet, Navigate } from "react-router-dom";
const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <div>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="flex w-screen h-screen">
          <section className="flex flex-col w-1/2 h-screen flex-1 justify-center items-center py-10">
            <Outlet />
          </section>
          <img
            src="/assets/images/side-img.svg"
            alt="logo"
            className="xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
