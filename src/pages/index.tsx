import { type NextPage } from "next";
import Link from "next/link";
import Card from "~/components/Card";

const Home: NextPage = () => {
  return (
    <>
      <Card />
      <Link
        href={`https://discord.com/oauth2/authorize?response_type=code&client_id=${
          process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string
        }&scope=identify%20guilds.join&redirect_uri=${encodeURIComponent(
          process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
        )}&prompt=consent`}
        className="w-full max-w-[15rem] rounded-md bg-zinc-900 px-4 py-2 text-center text-white"
      >
        Verify
      </Link>
    </>
  );
};

export default Home;
