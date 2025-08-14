import withAuth from '../../src/components/withAuth';
import RSVP from '../../src/pages/RSVP';

function RSVPPage() {
  return <RSVP />;
}

export default withAuth(RSVPPage);

