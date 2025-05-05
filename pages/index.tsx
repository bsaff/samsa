import type { User } from "@supabase/supabase-js";
import type { GetServerSidePropsContext } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/utils/supabase/server-props";
import styles from "./styles.module.css";
import { useState } from "react";
import { BiBookAdd, BiBookOpen } from "react-icons/bi";
import { PiPencilCircleDuotone, PiSpinnerLight } from "react-icons/pi";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: data.user,
    },
  };
}

export default function PrivatePage({ user }: { user: User }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      alert("Samsa is crafting you an mind-blowing essay; please wait a moment.");
      return;
    }

    setLoading(true);
    const input = document.getElementById("book_uploads") as HTMLInputElement;
    if (!input?.files) return;

    const formData = new FormData();
    Array.from(input.files).forEach((file) => {
      formData.append("files", file);
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setLoading(false);
    alert(result.message);
    setReport(result.report);
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <form
          method="post"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.uploader}>
            <div className={styles.uploads}>
              {fileNames.length > 0 && <h4 className={styles.uploadedTitle}>Books:</h4>}
              {!!fileNames.length ? (
                <ul>
                  {fileNames.map((name, index) => (
                    <li key={name} style={{}}>
                      <BiBookOpen style={getStyle(index)} />
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <BiBookOpen style={{ fontSize: 30 }} />
                </div>
              )}
            </div>
            <label htmlFor="book_uploads">
              <BiBookAdd /> Add books to upload
            </label>
            <input
              type="file"
              id="book_uploads"
              accept=".pdf,.epub,.xml"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFileNames([...fileNames, ...Array.from(e.target.files).map((f) => f.name)]);
                }
              }}
            />
            <small>Accepted formats:</small>
            <small>PDF, EPUB, XML</small>
          </div>

          <button
            type="submit"
            disabled={fileNames.length === 0}
            className={loading ? "loading" : ""}
          >
            {loading ? (
              <>
                <PiSpinnerLight />
              </>
            ) : (
              <>
                <PiPencilCircleDuotone style={{ fontSize: 20 }} /> Generate Essay
              </>
            )}
          </button>
        </form>
      </div>
      |
      {report && (
        <div className={styles.card}>
          {/* optional header or title */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
        </div>
      )}
    </main>
  );
}

const COLOR_MAP = [
  { bg: "var(--color-purple-200)", text: "var(--color-purple-950)" },
  { bg: "var(--color-blue-200)", text: "var(--color-blue-950)" },
  { bg: "var(--color-green-200)", text: "var(--color-green-950)" },
  { bg: "var(--color-yellow-200)", text: "var(--color-yellow-950)" },
  { bg: "var(--color-orange-200)", text: "var(--color-orange-950)" },
  { bg: "var(--color-red-200)", text: "var(--color-red-950)" },
] as const;

function getStyle(index: number) {
  const color = COLOR_MAP[index % COLOR_MAP.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
  };
}
