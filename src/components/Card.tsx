import Image from "next/image";
export default function Card({
  title,
  subtitle,
  image,
}: {
  title?: string;
  subtitle?: string;
  image?: string;
}) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-zinc-600">
      <Image
        src={image || (process.env.NEXT_PUBLIC_LOGO as string)}
        alt={title || (process.env.NEXT_PUBLIC_NAME as string)}
        width={80}
        height={80}
        className="rounded-full"
      />
      <div>
        <h1 className="text-2xl font-semibold">
          {title || process.env.NEXT_PUBLIC_NAME}
        </h1>
        <p className="text-xs">
          {subtitle ||
            `This Discord server is protected. Please verify yourself first to gain
          access.`}
        </p>
      </div>
    </div>
  );
}
