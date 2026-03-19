/* Landing page — redirect if already logged in */
(function () {
  const user = getSession();
  if (user) {
    window.location.href = user.role === 'owner'
      ? 'owner-dashboard.html'
      : 'tenant-dashboard.html';
  }
})();
