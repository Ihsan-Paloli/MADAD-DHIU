import logo from "../img/logo.png";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="MADAD — Medium for Associative and Directive Activities of Darul Huda"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
