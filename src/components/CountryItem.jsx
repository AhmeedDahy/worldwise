import styles from "./CountryItem.module.css";
const flagemojiToPNG = (flag) => {
  const countryCode = flag;
  return (
    <img
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      alt="flag"
    />
  );
};

function CountryItem({ country }) {
  return (
    <li className={styles.countryItem}>
      <span>{flagemojiToPNG(country.emoji || "")}</span>
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
