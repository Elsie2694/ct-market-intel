import "./globals.css";

export const metadata = {
  title: "Cooper and Tanner — Market Intelligence",
  description: "Competitor market intelligence across Cooper and Tanner catchments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
