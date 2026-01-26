// (A) Importamos la pieza que acabamos de crear
import BookingForm from "./components/BookingForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-6xl font-bold tracking-tighter">
          Estilo<span className="text-emerald-400">26</span>
        </h1>
        <p className="text-zinc-400 text-xl">
          Tu estilo, tu tiempo. Reservas inteligentes.
        </p>
      </div>

      {/* (B) AQUÍ PONEMOS EL COMPONENTE NUEVO */}
      {/* Ya no usamos el <button> simple, usamos todo el formulario */}
      <BookingForm />
    </div>
  );
}
