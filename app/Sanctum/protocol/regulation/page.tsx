import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function RegulationProtocolPage() {
  const filePath = path.join(
    process.cwd(),
    "app",
    "Sanctum",
    "protocols",
    "regulation.md"
  );
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div>
      <Link href="/sanctum">Exit Sanctum</Link>
      <article>
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
