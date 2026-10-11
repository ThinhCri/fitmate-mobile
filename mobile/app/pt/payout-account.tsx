import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react-native';
import { ptDashboardService, PtPayoutAccount } from '@/services/api/ptDashboardService';

const banks = [
  { bin: '970422', name: 'MB Bank' },
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970416', name: 'ACB' },
];

export default function PtPayoutAccountScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState<PtPayoutAccount | null>(null);
  const [bank, setBank] = useState(banks[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { ptDashboardService.getPayoutAccount().then((value) => { setCurrent(value); if (value) { setAccountNumber(value.account_number); setBank(banks.find((x) => x.bin === value.bank_code) || { bin: value.bank_code, name: value.bank_name }); } }).catch((e) => Alert.alert('Không thể tải', e instanceof Error ? e.message : 'Vui lòng thử lại.')).finally(() => setLoading(false)); }, []);
  async function save() { try { setSaving(true); const value = await ptDashboardService.savePayoutAccount(bank.bin, bank.name, accountNumber); setCurrent(value); Alert.alert('Đã xác minh', `Tên chủ tài khoản: ${value.account_name}`); } catch (e) { Alert.alert('Không thể xác minh', e instanceof Error ? e.message : 'Kiểm tra lại ngân hàng và số tài khoản.'); } finally { setSaving(false); } }
  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  return <SafeAreaView style={styles.page}><View style={styles.header}><TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#111827" /></TouchableOpacity><Text style={styles.title}>Tài khoản nhận tiền</Text><View style={{ width: 24 }} /></View><View style={styles.content}><View style={styles.notice}><ShieldCheck size={20} color="#0F766E" /><Text style={styles.noticeText}>Số điện thoại phải được xác minh. Tên chủ tài khoản do ngân hàng trả về; hãy kiểm tra kỹ trước khi lưu.</Text></View>{current && <View style={styles.verified}><Landmark size={22} color="#0F766E" /><View><Text style={styles.verifiedTitle}>{current.account_name}</Text><Text style={styles.muted}>{current.bank_name} · {current.masked_account_number}</Text></View></View>}<Text style={styles.label}>Ngân hàng</Text><View style={styles.bankGrid}>{banks.map((item) => <TouchableOpacity key={item.bin} style={[styles.bankChip, item.bin === bank.bin && styles.bankChipActive]} onPress={() => setBank(item)}><Text style={item.bin === bank.bin ? styles.bankActiveText : styles.bankText}>{item.name}</Text></TouchableOpacity>)}</View><Text style={styles.label}>Số tài khoản</Text><TextInput value={accountNumber} onChangeText={(v) => setAccountNumber(v.replace(/\D/g, ''))} keyboardType="number-pad" style={styles.input} placeholder="Nhập số tài khoản" /><TouchableOpacity style={[styles.button, saving && { opacity: .6 }]} disabled={saving || accountNumber.length < 6} onPress={save}><Text style={styles.buttonText}>{saving ? 'Đang xác minh…' : 'Xác minh và lưu'}</Text></TouchableOpacity></View></SafeAreaView>;
}
const styles = StyleSheet.create({ page:{flex:1,backgroundColor:'#F8FAFC'},center:{flex:1,alignItems:'center',justifyContent:'center'},header:{height:56,backgroundColor:'#fff',paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},title:{fontSize:17,fontWeight:'700',color:'#111827'},content:{padding:16,gap:12},notice:{padding:14,borderRadius:12,backgroundColor:'#ECFDF5',flexDirection:'row',gap:10},noticeText:{flex:1,fontSize:13,lineHeight:19,color:'#065F46'},verified:{backgroundColor:'#fff',borderWidth:1,borderColor:'#99F6E4',borderRadius:12,padding:14,flexDirection:'row',gap:12,alignItems:'center'},verifiedTitle:{fontSize:14,fontWeight:'700',color:'#111827'},muted:{fontSize:12,color:'#64748B',marginTop:2},label:{fontSize:13,fontWeight:'700',color:'#334155',marginTop:4},bankGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},bankChip:{paddingHorizontal:12,paddingVertical:9,borderRadius:10,borderWidth:1,borderColor:'#CBD5E1',backgroundColor:'#fff'},bankChipActive:{borderColor:'#0F766E',backgroundColor:'#ECFDF5'},bankText:{fontSize:13,color:'#334155'},bankActiveText:{fontSize:13,color:'#0F766E',fontWeight:'700'},input:{height:48,borderWidth:1,borderColor:'#CBD5E1',borderRadius:12,paddingHorizontal:14,backgroundColor:'#fff',fontSize:15,color:'#111827'},button:{height:48,borderRadius:12,backgroundColor:'#0F766E',alignItems:'center',justifyContent:'center',marginTop:8},buttonText:{color:'#fff',fontWeight:'700',fontSize:15} });
