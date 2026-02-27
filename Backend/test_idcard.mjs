// temp test — delete after debugging
import { generateIdCard } from './utils/idCardGenerator.js';

const v = {
  fullName: 'Test Volunteer',
  volunteerId: 'HCT010124TEST',
  profilePicture: null,
  status: 'active'
};

try {
  console.time('gen');
  const buf = await generateIdCard(v);
  console.timeEnd('gen');
  console.log('SUCCESS bytes:', buf.length, '| PDF magic:', buf.slice(0,4).toString());
} catch(e) {
  console.error('FAILED:', e.message);
  console.error(e.stack);
}
