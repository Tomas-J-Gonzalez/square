import withAuth from '../../src/components/withAuth';
import RSVP from '../../src/pages/RSVP';

function RSVPPage() {
  return <RSVP />;
}

export default withAuth(RSVPPage);

// Let invite links work for the logged-in redirect case; RSVP remains protected
RSVPPage.noLayout = true;

