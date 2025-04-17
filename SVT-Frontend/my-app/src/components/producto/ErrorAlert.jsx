import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert";
  import { AlertCircle } from "lucide-react";
  
  export default function ErrorAlert({ error, className }) {
    // Renderizar error de manera segura
    const renderError = (errorMessage) => {
      if (!errorMessage) return null;
      
      // Si es un string, mostrarlo directamente
      if (typeof errorMessage === 'string') {
        return errorMessage;
      }
      
      // Si es un array, mostrar el primer mensaje
      if (Array.isArray(errorMessage)) {
        return errorMessage.map((err, index) => 
          <div key={index}>{typeof err === 'string' ? err : 'Error de validación'}</div>
        );
      }
      
      // Si es un objeto con detail, intentar mostrarlo
      if (errorMessage.detail) {
        if (typeof errorMessage.detail === 'string') {
          return errorMessage.detail;
        }
        if (Array.isArray(errorMessage.detail)) {
          return errorMessage.detail.map((err, index) => 
            <div key={index}>{err.msg || 'Error de validación'}</div>
          );
        }
      }
      
      // Fallback para cualquier otro caso
      return 'Error desconocido';
    };
  
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{renderError(error)}</AlertDescription>
      </Alert>
    );
  }