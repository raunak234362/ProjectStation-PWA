import React from "react";
import { Button as UiButton } from "../ui/button";

type ButtonProps = React.ComponentProps<typeof UiButton>;

const Button: React.FC<ButtonProps> = (props) => {
  return <UiButton {...props} />;
};

export default Button;
