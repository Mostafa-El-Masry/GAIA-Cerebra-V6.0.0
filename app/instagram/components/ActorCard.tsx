import Link from "next/link";
import Image from "next/image";

interface Actor {
  id: string;
  avatar_url: string;
  name: string;
}

interface ActorCardProps {
  actor: Actor;
}

export function ActorCard({ actor }: ActorCardProps) {
  return (
    <Link href={`/instagram/people/${actor.id}`}>
      <div>
        <div>
          <Image
            src={actor.avatar_url}
            alt={`${actor.name}'s avatar`}
            width={64}
            height={64}
          />
        </div>
      </div>

      <span>{actor.name}</span>
    </Link>
  );
}
