import { Cena, type PropsCena } from "./Cena";

/** Barraca de feira com frutas. */
export function CenaFeira(props: PropsCena) {
  return (
    <Cena {...props}>
      <rect width="320" height="180" fill="#FFE4D6" />
      <path d="M40 40 h240 l-12 30 H52 z" fill="#FF6B35" />
      <path
        d="M70 40 l-6 30 M110 40 l-3 30 M150 40 v30 M190 40 l3 30 M230 40 l6 30"
        stroke="#FDFAF4"
        strokeWidth="10"
      />
      <path d="M60 70 v80 M260 70 v80" stroke="#0A3D62" strokeWidth="5" strokeLinecap="round" />
      <rect x="52" y="112" width="216" height="40" rx="6" fill="#0A3D62" />
      <circle cx="88" cy="104" r="14" fill="#E3BA14" />
      <circle cx="114" cy="106" r="12" fill="#00B894" />
      <circle cx="140" cy="104" r="14" fill="#C2410C" />
      <circle cx="182" cy="105" r="13" fill="#E3BA14" />
      <circle cx="208" cy="104" r="14" fill="#00B894" />
      <circle cx="234" cy="106" r="12" fill="#FF6B35" />
    </Cena>
  );
}
