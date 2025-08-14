import Invite from '../../src/pages/Invite';

export default function InvitePage() {
  return <Invite />;
}

// Make invite route public (no layout still allowed via gate in _app)
InvitePage.noLayout = true;

