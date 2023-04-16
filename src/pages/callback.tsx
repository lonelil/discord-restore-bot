import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Turnstile } from "@marsidev/react-turnstile";
import Card from "~/components/Card";

const Callback: NextPage = () => {
  const router = useRouter();
  const { code, error } = router.query;
  const { mutate } = api.discord.callback.useMutation();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("waiting");
  const [user, setUser] = useState({
    username: "",
    avatar: "",
  });

  useEffect(() => {
    if (code && token) {
      mutate(
        { code: code as string, captcha_token: token },
        {
          onSuccess: (data) => {
            setStatus("success");
            setUser({
              username: data.user.username,
              avatar: data.user.avatar,
            });
          },
        }
      );
    }
  }, [code, token]);

  useEffect(() => {
    if (error) {
      setStatus("error");
    }
  }, [error]);

  return (
    <>
      {status === "error" && (
        <Card subtitle="An error occurred while verifying your account. Please try again later." />
      )}

      {status === "waiting" && (
        <>
          <Card subtitle="Verification in progress. Please be patient." />
          <Turnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY as string}
            onSuccess={setToken}
          />
        </>
      )}

      {status === "success" && (
        <Card
          title={`Hello, ${user.username}!`}
          subtitle="Thank you for verifying your account and joining our Discord server."
          image={user.avatar}
        />
      )}
    </>
  );
};

export default Callback;
