import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PetAvatarCard({ pet, onPickImage, onChangeBadge, onChangeColor }) {
  const accentColor = pet.avatarColor || '#0D9488';

  return (
    <View style={styles.card}>
      {/* Faixa de cor da identidade do Pet no topo do Card */}
      <View style={[styles.topAccentStrip, { backgroundColor: accentColor }]} />

      <View style={styles.cardBody}>
        <View style={styles.topRow}>
          {/* Avatar Circular com anel de destaque */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPickImage}
              style={[styles.avatarRing, { borderColor: accentColor }]}
            >
              <View style={[styles.avatarWrapper, { backgroundColor: accentColor + '20' }]}>
                {pet.photoUri ? (
                  <Image source={{ uri: pet.photoUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.placeholderEmoji}>
                    {pet.species === 'cat' ? '🐱' : '🐶'}
                  </Text>
                )}
              </View>
              <View style={[styles.cameraOverlayBtn, { backgroundColor: accentColor }]}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            {/* Badge do Personagem */}
            <View style={[styles.badgePill, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{pet.avatarBadge || 'Super Pet ⭐'}</Text>
            </View>
          </View>

          {/* Informações Principais do Pet */}
          <View style={styles.infoColumn}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <View style={styles.speciesTag}>
                <Text style={styles.speciesTagText}>
                  {pet.species === 'cat' ? 'Felino' : 'Canino'}
                </Text>
              </View>
            </View>

            <Text style={styles.petBreed}>{pet.breed}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statChip}>
                <Ionicons name="scale-outline" size={14} color="#0D9488" />
                <Text style={styles.statChipText}>{pet.weight} kg</Text>
              </View>

              <View style={styles.statChip}>
                <Ionicons
                  name={pet.gender === 'female' ? 'female-outline' : 'male-outline'}
                  size={14}
                  color={pet.gender === 'female' ? '#E11D48' : '#2563EB'}
                />
                <Text style={styles.statChipText}>
                  {pet.gender === 'female' ? 'Fêmea' : 'Macho'}
                </Text>
              </View>

              <View style={styles.statChip}>
                <Ionicons
                  name={pet.isNeutered ? 'shield-checkmark-outline' : 'sparkles-outline'}
                  size={14}
                  color="#D97706"
                />
                <Text style={styles.statChipText}>
                  {pet.isNeutered ? 'Castrado' : 'Intacto'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Barra de Customização do Personagem */}
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.customBtn} onPress={onPickImage}>
            <Ionicons name="image-outline" size={16} color="#334155" />
            <Text style={styles.customBtnText}>Trocar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.customBtn} onPress={onChangeBadge}>
            <Ionicons name="ribbon-outline" size={16} color="#334155" />
            <Text style={styles.customBtnText}>Trocar Título</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.customBtn} onPress={onChangeColor}>
            <Ionicons name="color-palette-outline" size={16} color="#334155" />
            <Text style={styles.customBtnText}>Cor do Tema</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
    flex: 1,
    justifyContent: 'space-between',
  },
  topAccentStrip: {
    height: 8,
    width: '100%',
  },
  cardBody: {
    padding: 22,
    justifyContent: 'space-between',
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarRing: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2.5,
    position: 'relative',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  placeholderEmoji: {
    fontSize: 46,
  },
  cameraOverlayBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgePill: {
    marginTop: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  infoColumn: {
    flex: 1,
    minWidth: 180,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  petName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  speciesTag: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  speciesTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  petBreed: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  customBtn: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  customBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
