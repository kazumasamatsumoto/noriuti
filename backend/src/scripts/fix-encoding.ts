import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { databaseConfig } from '../config/database.config';

async function fixUserEncoding() {
  const dataSource = new DataSource(databaseConfig as any);
  await dataSource.initialize();
  
  const userRepository = dataSource.getRepository(User);
  const users = await userRepository.find();
  
  console.log('Found users:', users.length);
  
  for (const user of users) {
    console.log(`User ID: ${user.id}`);
    console.log(`Current name: "${user.name}"`);
    console.log(`Name buffer:`, Buffer.from(user.name || '', 'utf8'));
    
    // 文字化けパターンをチェック
    if (user.name && user.name.includes('�')) {
      console.log(`⚠️  User ${user.id} has corrupted characters in name`);
      
      // 名前をリセットする（または手動で正しい値を設定）
      const correctedName = prompt(`Enter correct name for user ${user.id} (current: "${user.name}"):`);
      if (correctedName) {
        user.name = correctedName;
        await userRepository.save(user);
        console.log(`✅ Updated user ${user.id} name to: "${correctedName}"`);
      }
    }
  }
  
  await dataSource.destroy();
  console.log('Encoding fix completed');
}

fixUserEncoding().catch(console.error);