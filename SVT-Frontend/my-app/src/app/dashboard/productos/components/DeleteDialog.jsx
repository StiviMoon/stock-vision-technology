import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ErrorAlert from './ErrorAlert';

export default function DeleteDialog({
  isOpen,
  onOpenChange,
  producto,
  onConfirm,
  isDeleting,
  error,
}) {
  if (!producto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            Esta acción eliminará permanentemente el producto y no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert error={error} className='my-2' />}

        <div className='py-4'>
          <p className='text-center font-medium'>
            ¿Está seguro que desea eliminar el producto{' '}
            <span className='font-bold text-foreground'>
              {producto?.nombre}
            </span>
            ?
          </p>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
