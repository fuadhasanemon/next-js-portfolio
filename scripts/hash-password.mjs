/**
 * Generates the bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 *   npm run hash:password -- "your-password"
 *
 * Next.js pipes .env through dotenv-expand, which treats the `$` segments of a
 * bcrypt hash as variable references and silently eats them. So the line this
 * prints escapes every `$` as `\$` — paste it verbatim, quotes included.
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error('Usage: npm run hash:password -- "a-password-of-10+-chars"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escaped = hash.replace(/\$/g, "\\$");

console.log("\nPaste this line into .env exactly as shown:\n");
console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
console.log(
  "\nFor Vercel, paste the UNESCAPED hash instead (the dashboard stores it literally):\n"
);
console.log(hash);
console.log("");
