import withAuth from '../../src/components/withAuth';
import ViewEvent from '../../src/pages/ViewEvent';

function EventPage() {
  return <ViewEvent />;
}

export default withAuth(EventPage);

