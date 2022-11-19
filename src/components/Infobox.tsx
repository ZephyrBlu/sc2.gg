import './Infobox.css';

export function Infobox({ children }) {
  return (
    <div className="Infobox">
      <div className="Infobox__content">
        {children}
      </div>
    </div>
  );
}
