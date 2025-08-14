import withAuth from '../src/components/withAuth';
import PastEvents from '../src/pages/PastEvents';

function PastPage() {
  return <PastEvents />;
}

export default withAuth(PastPage);

