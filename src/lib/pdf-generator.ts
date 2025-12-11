import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Define interfaces for the data we need
interface WorkOrderData {
  orderNumber: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: Date
  clientName: string
  clientEmail: string
  clientPhone: string
  address: string
  technicianName?: string
}

export const generateWorkOrderPDF = (order: WorkOrderData) => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(22)
  doc.text('TecniPro', 14, 20)
  
  doc.setFontSize(12)
  doc.text('Orden de Servicio', 14, 30)
  
  doc.setFontSize(10)
  doc.text(`Orden #: ${order.orderNumber}`, 14, 40)
  doc.text(`Fecha: ${order.createdAt.toLocaleDateString()}`, 14, 45)
  doc.text(`Estado: ${order.status}`, 14, 50)
  doc.text(`Prioridad: ${order.priority}`, 14, 55)

  // Client Info
  doc.text('Cliente:', 120, 40)
  doc.text(order.clientName, 120, 45)
  doc.text(order.clientPhone, 120, 50)
  doc.text(order.clientEmail, 120, 55)
  
  // Details
  doc.line(14, 65, 196, 65)
  
  doc.setFontSize(14)
  doc.text('Detalles del Trabajo', 14, 75)
  
  doc.setFontSize(11)
  doc.text(`Título: ${order.title}`, 14, 85)
  
  doc.text('Descripción:', 14, 95)
  const splitDescription = doc.splitTextToSize(order.description, 180)
  doc.text(splitDescription, 14, 100)
  
  // Service Address
  const yPos = 100 + (splitDescription.length * 5) + 10
  doc.text('Dirección de Servicio:', 14, yPos)
  doc.text(order.address, 14, yPos + 5)
  
  // Technician
  if (order.technicianName) {
    doc.text(`Técnico Asignado: ${order.technicianName}`, 14, yPos + 15)
  }

  // Footer
  doc.setFontSize(8)
  doc.text('TecniPro - Soluciones Técnicas Industriales', 14, 280)
  doc.text('www.tecnipro.com', 14, 285)

  // Save the PDF
  doc.save(`Orden_${order.orderNumber}.pdf`)
}
