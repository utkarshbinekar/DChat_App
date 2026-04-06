import { cn } from "@/lib/utils";

export default function Chat({
  mine,
  message,
  avatar
}: {
  mine: boolean;
  message: string;
  avatar: string
}) {
  return (
    <div
      className={cn("flex gap-3 justify-start w-full", {
        "flex-row-reverse": mine,
      })}>
      {!mine && (
        <div className="w-10 h-10 bg-secondary overflow-hidden rounded-full hidden md:flex">
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={cn("w-max max-w-xl h-max bg-secondary rounded-xl", {
          "bg-primary": mine,
        })}>
        {message.startsWith("http://localhost:") && message.includes("/uploads/") ? (
          <img src={message} alt="attachment" className="rounded-xl w-60 object-cover" />
        ) : (
          <p className="text-sm px-3 py-[10px] break-words">{message}</p>
        )}
      </div>
    </div>
  );
}
