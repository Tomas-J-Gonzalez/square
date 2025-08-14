import withAuth from '../src/components/withAuth';
import CreateEvent from '../src/pages/CreateEvent';

function CreatePage() {
  return <CreateEvent />;
}

export default withAuth(CreatePage);

