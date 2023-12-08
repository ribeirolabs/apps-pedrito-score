import { FormHTMLAttributes } from "react";
import { useGameActions } from "../core/game";
import qs from "qs";

export function Form({
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  const action = useGameActions();

  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const submitter = (e.nativeEvent as SubmitEvent).submitter;

        if (submitter?.tagName === "BUTTON" && submitter.getAttribute("name")) {
          formData.set(
            submitter.getAttribute("name")!,
            submitter.getAttribute("value") ?? ""
          );
        }

        // @ts-ignore
        const query = new URLSearchParams(formData).toString();

        const payload = qs.parse(query);

        action(payload as any);
      }}
    >
      {children}
    </form>
  );
}
