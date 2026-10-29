import Modal from '../ui/Modal';
import StudentForm from './StudentForm';

// Pass `student` to edit it; omit it to create a new one.
export default function StudentFormModal({ student, onSubmit, onClose }) {
  const editing = Boolean(student);
  return (
    <Modal
      title={editing ? 'Edit student' : 'Add student'}
      description={editing ? 'Update the student’s details.' : 'Fill in the details of the new student.'}
      onClose={onClose}
    >
      <StudentForm initial={student} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
}
