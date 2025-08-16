import withAuth from '../src/components/withAuth';
import Home from '../src/pages/Home';

function DashboardPage() {
  return <Home />;
}

export default withAuth(DashboardPage);
