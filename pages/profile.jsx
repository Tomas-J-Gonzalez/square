import withAuth from '../src/components/withAuth';
import Profile from '../src/pages/Profile';

function ProfilePage() {
  return <Profile />;
}

export default withAuth(ProfilePage);

