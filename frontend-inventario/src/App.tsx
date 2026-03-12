import { BalletInventory } from './components/BalletInventory';

function App() {
  return (
    <div>
      <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>Sistema de Gestión</h1>
      </header>
      
      <main>
        {/* Aquí estamos llamando a tu componente */}
        <BalletInventory />
      </main>
    </div>
  )
}

export default App;