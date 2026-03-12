import React, { useState, useEffect } from 'react';

interface InventoryItemAttributes {
  title: string;
  field_codigo_unico: string;
  field_cantida_de_stock: number; // <-- ¡El nombre con el pequeño error de tipeo!
  field_disponible_para_prestamo: boolean;
}

interface InventoryItem {
  id: string;
  attributes: InventoryItemAttributes;
}

export const BalletInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Estado para controlar los datos del nuevo formulario
  const [formData, setFormData] = useState({
    title: '',
    codigo: '',
    cantidad: 0,
    disponible: true
  });

  // Función para cargar el inventario (la separamos para poder llamarla de nuevo tras guardar)
  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8080/jsonapi/node/elemento_de_inventario');
      const result = await response.json();
      setItems(result.data || []);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 2. Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⚠️ IMPORTANTE: Reemplaza esto con el usuario y contraseña que usas para entrar a tu Drupal
    // La función btoa() lo codifica en Base64, que es como lo exige Basic Auth
    const credenciales = btoa('Alexander:LOSALEX15a');// Reemplaza 'Alexander' y 'LOSALEX15a' por tu usuario y contraseña reales

    // 3. Estructuramos el cuerpo de la petición exactamente como lo exige JSON:API
    const payload = {
      data: {
        type: "node--elemento_de_inventario",
        attributes: {
          title: formData.title,
          field_codigo_unico: formData.codigo,
          field_cantida_de_stock: Number(formData.cantidad), // <-- Aquí también
          field_disponible_para_prestamo: formData.disponible
        }
      }
  };

    try {
      const response = await fetch('http://localhost:8080/jsonapi/node/elemento_de_inventario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json', // Tipo de contenido obligatorio para JSON:API
          'Accept': 'application/vnd.api+json',
          'Authorization': `Basic ${credenciales}` // Enviamos las credenciales
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("¡Artículo guardado exitosamente!");
        // Limpiamos el formulario
        setFormData({ title: '', codigo: '', cantidad: 0, disponible: true });
        // Recargamos la lista para ver el nuevo artículo
        fetchInventory();
      } else {
        const errorData = await response.json();
        console.error("Error de Drupal:", errorData);
        alert("Hubo un error al guardar. Revisa la consola.");
      }
    } catch (error) {
      console.error("Error en la petición POST:", error);
    }
  };

  if (loading) return <p>Cargando inventario del almacén...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 4. El formulario de ingreso */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Ingresar Nuevo Artículo</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <input 
            type="text" 
            placeholder="Nombre (Ej. Malla negra talla M)" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required 
            style={{ padding: '8px' }}
          />
          
          <input 
            type="text" 
            placeholder="Código Único (Ej. BAL-MAL-002)" 
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            required 
            style={{ padding: '8px' }}
          />
          
          <input 
            type="number" 
            placeholder="Cantidad en stock" 
            value={formData.cantidad}
            onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
            required 
            style={{ padding: '8px' }}
          />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={formData.disponible}
              onChange={(e) => setFormData({...formData, disponible: e.target.checked})}
            />
            Disponible para préstamo
          </label>

          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar en Inventario
          </button>
        </form>
      </div>

      {/* La lista que ya teníamos */}
      <h2>Inventario General</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{item.attributes.title}</h3>
            <p><strong>Código:</strong> {item.attributes.field_codigo_unico}</p>
            <p><strong>Stock en almacén:</strong> {item.attributes.field_cantida_de_stock} unidades</p>
            <p>
              <strong>Estado:</strong>{' '}
              {item.attributes.field_disponible_para_prestamo ? '🟢 Disponible para préstamo' : '🔴 En uso / Agotado'}
            </p>
          </li>
        ))}
      </ul>

    </div>
  );
};