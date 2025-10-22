import Background from "../assets/background-image.jpg";

import { Login as LoginTemp } from "../components/index";
const Login = () => {
  return (
    <div className="w-screen h-screen relative">
      {/* <LampContainer>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
        </motion.h1>
      </LampContainer> */}
      <img
        src={Background}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover blur-[8px] z-0"
      />

      {<LoginTemp />}
    </div>
  );
};

export default Login;
